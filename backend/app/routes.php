<?php
declare(strict_types=1);

use Slim\App;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

require 'Database.php';
require 'Authentication.php'; 

return function (App $app) {
    //Fetch all tags
    $app->get('/api/tags', function (Request $request, Response $response, $args) {
        $db = (new Database)->getCon();
        $sql = "SELECT * FROM tags";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if(isset($_SERVER['HTTP_AUTHORIZATION'])) {
            //Fetch private tags as well
            $userData = Authentication::validate($_SERVER['HTTP_AUTHORIZATION']);
            if($userData) {
                //valid token
                $sql = "SELECT tag_name, COUNT(tag_name) as cnt FROM private_tags WHERE username = (:username) GROUP by tag_name";
                $stmt = $db->prepare($sql);
                $stmt->execute(['username' => $userData['username']]);
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $res[] = (object)[
                        'tag_name' => $row['tag_name'], 
                        'type' => 'private',
                        'count' => $row['cnt']
                    ];
                }
            }
        }
        $response->getBody()->write(json_encode($res));
        return $response ->withHeader('Access-Control-Allow-Origin', '*');
    });

    //Search tags
    $app->get('/api/tags/search/{val}', function (Request $request, Response $response, $args) {
        $db = (new Database)->getCon();
        $sql = "SELECT * FROM tags WHERE tag_name LIKE '%";
        $sql .=$args['val'];
        $sql .= "%' ";
        $sql .= "LIMIT 10";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if(isset($_SERVER['HTTP_AUTHORIZATION'])) {
            //Fetch private tags as well
            $userData = Authentication::validate($_SERVER['HTTP_AUTHORIZATION']);
            if($userData) {
                //valid token
                $sql = "SELECT DISTINCT tag_name FROM private_tags WHERE username = (:username) and tag_name LIKE '%";
                $sql .=$args['val'];
                $sql .= "%' ";
                $sql .= "LIMIT 10";
                $stmt = $db->prepare($sql);
                $stmt->execute(['username' => $userData['username']]);
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $res[] = (object)['tag_name' => $row['tag_name'], 
                    'type' => 'private'];
                }
            }
        }
        $response->getBody()->write(json_encode($res));
        return $response->withHeader('Access-Control-Allow-Origin', '*');
    });
    
    //Fetch problems
    $app->get('/api/tags/problems', function (Request $request, Response $response, $args) {
        $db = (new Database)->getCon();
        $tag_list = explode(",", $_GET['filter']);
        $sql = "SELECT problems.problemCode, problems.problemName, problems.author, problems.challengeType, problems.successfulSubmissions FROM tag_problem join problems on problems.problemCode = tag_problem.problemCode where ";
        $len = count($tag_list);
        for($i = 0; $i < $len; $i++) {
            $sql = $sql." tag_name='".$tag_list[$i]."'";
            if($i < $len - 1) $sql = $sql." or ";
        }
        $sql .= " group by problems.problemCode";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if(isset($_SERVER['HTTP_AUTHORIZATION'])) {
            //Fetch private tags as well
            $userData = Authentication::validate($_SERVER['HTTP_AUTHORIZATION']);
            if($userData) {
                //valid token
                $sql = "SELECT problems.problemCode, problems.problemName, problems.author, problems.challengeType, problems.successfulSubmissions FROM private_tags join problems on problems.problemCode = private_tags.problemCode where username = (:username) and (";
                $len = count($tag_list);
                for($i = 0; $i < $len; $i++) {
                    $sql = $sql." tag_name='".$tag_list[$i]."'";
                    if($i < $len - 1) $sql = $sql." or ";
                }
                $sql .= ") group by problems.problemCode";
                $stmt = $db->prepare($sql);
                $stmt->execute(['username' => $userData['username']]);
                $res = array_merge($res, $stmt->fetchAll(PDO::FETCH_ASSOC));
            }
        }
        $unique_res = [];
        foreach($res as $val) 
            $unique_res[serialize($val)] = $val;
        $res = array_values($unique_res);
        $response->getBody()->write(json_encode($res));
        return $response->withHeader('Access-Control-Allow-Origin', '*');
    });
        
    //Add Tag 
     $app->post('/api/problem/tag', function (Request $request, Response $response, $args) {
        if(!isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $res = [
                'code' => 9003,
                'message' => 'Authorization header not found'
            ];
            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Access-Control-Allow-Origin', '*');
        }
        $userData = Authentication::validate($_SERVER['HTTP_AUTHORIZATION']);
        if(!$userData) {
            $res = [
                'code' => 9003,
                'message' => 'Invalid token'
            ];
            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Access-Control-Allow-Origin', '*');
        }
        $problemCode = $_POST['problemCode'];
        $customTag = $_POST['customTag'];
        if(!$problemCode or !$customTag) {
             $res = [
                'code' => 9003,
                'message' => 'Invalid data recieved'
            ];
            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Access-Control-Allow-Origin', '*');
        }
        $db = (new Database)->getCon();
        //Check whether tag already added for given problem
        $sql1 = "SELECT * FROM tag_problem WHERE tag_name=(:tag_name) and problemCode=(:problemCode)";
        $stmt1 = $db->prepare($sql1);
        $stmt1->execute([
            'tag_name' => $customTag,
            'problemCode' => $problemCode
        ]);
        //Check in private tags as well
        $sql2 = "SELECT * FROM private_tags WHERE tag_name=(:tag_name) and problemCode=(:problemCode) and username=(:username)";
        $stmt2 = $db->prepare($sql2);
        $stmt2->execute([
            'tag_name' => $customTag,
            'problemCode' => $problemCode,
            'username' => $userData['username']
        ]);
        if($stmt1->fetch(PDO::FETCH_ASSOC) || $stmt2->fetch(PDO::FETCH_ASSOC)) {
            $res = [
                'code' => 9003,
                'message' => 'Tag already added'
            ];
            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Access-Control-Allow-Origin', '*');
        }
        //Insert tag
        $sql = "INSERT into private_tags values (:username, :problemCode, :tag_name)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            'tag_name' => $customTag,
            'problemCode' => $problemCode,
            'username' => $userData['username']
        ]);
        $res = [
            'code' => 9001,
            'message' => 'Success',
        ];
        $response->getBody()->write(json_encode($res));
        return $response->withHeader('Access-Control-Allow-Origin', '*');
    });


    //Signup
    $app->post('/api/signup', function (Request $request, Response $response, $args) {
        $db = (new Database)->getCon();
        $username = $_POST['username'];
        $password = $_POST['password'];
        if(!$username or !$password) {
            $res = [
                'code' => 9006,
                'message' => 'Invalid data recieved'
            ];
            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Access-Control-Allow-Origin', '*');
        } 
        $sql = "SELECT * from users where username='".$username."'";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $user = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if(count($user)) { 
            // If user already exists
            $res = [
                'code' => 9004,
                'message' => 'User already exists'
            ];
            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Access-Control-Allow-Origin', '*');
        }
        // Create new user
        $sql = "INSERT into users (username, password) values (:username, :password)";
        $var = [
            "username" => $username,
            "password" => md5($password)
        ];
        $db->prepare($sql)->execute($var); 
        $res = [
            'code' => 9001,
            'message' => 'Success',
            'username' => $username,
            'token' => Authentication::generate_token($username)
        ];
        $response->getBody()->write(json_encode($res));
        return $response->withHeader('Access-Control-Allow-Origin', '*');
    });

    //Login
    $app->post('/api/login', function (Request $request, Response $response, $args) {
        $db = (new Database)->getCon();
        $username = $_POST['username'];
        $password = $_POST['password'];
        if(!$username or !$password) {
            $res = [
                'code' => 9006,
                'message' => 'Invalid data recieved'
            ];
            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Access-Control-Allow-Origin', '*');
        } 
        $sql = "SELECT * from users where username='".$username."'";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if(!$user or md5($password) != $user['password']) { 
            // Incorrect username/password
            $res = [
                'code' => 9003,
                'message' => 'Username or Password Incorrect'
            ];
            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Access-Control-Allow-Origin', '*');
        } 
        $res = [
            'code' => 9001,
            'message' => 'Success',
            'username' => $username,
            'token' => Authentication::generate_token($username)
        ];
        $response->getBody()->write(json_encode($res));
        return $response->withHeader('Access-Control-Allow-Origin', '*');
    });

    //Get User
    $app->get('/api/getUser', function (Request $request, Response $response, $args) {
        if(!isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $res = [
                'code' => 9003,
                'message' => 'Authorization header not found'
            ];
            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Access-Control-Allow-Origin', '*');
        }
        $userData = Authentication::validate($_SERVER['HTTP_AUTHORIZATION']);
        if(!$userData) {
            $res = [
                'code' => 9003,
                'message' => 'Invalid token'
            ];
            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Access-Control-Allow-Origin', '*');
        }
        $res = [
            'code' => 9001,
            'message' => 'Success',
            'username' => $userData['username']
        ];
        $response->getBody()->write(json_encode($res));
        return $response->withHeader('Access-Control-Allow-Origin', '*');
    });    

    

};
