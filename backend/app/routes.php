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
        $db = Database::getCon();
        $sql = "SELECT * FROM tags";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if(isset($_SERVER['HTTP_AUTHORIZATION'])) {
            //Fetch private tags as well
            $userData = Authentication::validate($_SERVER['HTTP_AUTHORIZATION']);
            if($userData) {
                //valid token
                $sql = "SELECT DISTINCT tag_name FROM private_tags WHERE username = (:username)";
                $stmt = $db->prepare($sql);
                $stmt->execute(['username' => $userData['username']]);
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $res[] = (object)['tag_name' => $row['tag_name'], 
                    'type' => 'private'];
                }
            }
        }
        $response->getBody()->write(json_encode($res));
        return $response;
    });

    //Search tags
    $app->get('/api/tags/search/{val}', function (Request $request, Response $response, $args) {
        $db = Database::getCon();
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
        return $response;
    });
    
    //Fetch by tag ids
    $app->get('/api/tags/{tag_id}', function (Request $request, Response $response, $args) {
        $db = Database::getCon();
        $tag_list = explode(",", $args['tag_id']);
        $sql = "SELECT problems.id, problems.contestCode, problems.problemCode, problems.problemName, problems.author, problems.challengeType, problems.successfulSubmissions FROM tag_problem join problems on problems.id = problem_id where ";
        $len = count($tag_list);
        for($i = 0; $i < $len; $i++) {
            $sql = $sql." tag_id=".$tag_list[$i];
            if($i < $len - 1) $sql = $sql." or ";
        }
        $sql .= " group by problems.problemCode";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $response->getBody()->write(json_encode($stmt->fetchAll(PDO::FETCH_ASSOC)));
        return $response;
    });

    //Signup
    $app->post('/api/signup', function (Request $request, Response $response, $args) {
        $db = Database::getCon();
        $username = $_POST['username'];
        $password = $_POST['password'];
        if(!$username or !$password) {
            $res = [
                'code' => 9006,
                'message' => 'Invalid data recieved'
            ];
            $response->getBody()->write(json_encode($res));
            return $response;
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
            return $response;
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
        return $response;
    });

    //Login
    $app->post('/api/login', function (Request $request, Response $response, $args) {
        $db = Database::getCon();
        $username = $_POST['username'];
        $password = $_POST['password'];
        if(!$username or !$password) {
            $res = [
                'code' => 9006,
                'message' => 'Invalid data recieved'
            ];
            $response->getBody()->write(json_encode($res));
            return $response;
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
            return $response;
        } 
        $res = [
            'code' => 9001,
            'message' => 'Success',
            'username' => $username,
            'token' => Authentication::generate_token($username)
        ];
        $response->getBody()->write(json_encode($res));
        return $response;
    });

    //Get User
    $app->get('/api/getUser', function (Request $request, Response $response, $args) {
        if(!isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $res = [
                'code' => 9003,
                'message' => 'Authorization header not found'
            ];
            $response->getBody()->write(json_encode($res));
            return $response;
        }
        $userData = Authentication::validate($_SERVER['HTTP_AUTHORIZATION']);
        if(!$userData) {
            $res = [
                'code' => 9003,
                'message' => 'Invalid token'
            ];
            $response->getBody()->write(json_encode($res));
            return $response;
        }
        $res = [
            'code' => 9001,
            'message' => 'Success',
            'username' => $userData['username']
        ];
        $response->getBody()->write(json_encode($res));
        return $response;
    });    

    

};
