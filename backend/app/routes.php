<?php
declare(strict_types=1);

use Slim\App;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

require 'Authentication.php';

//DB Connection
function getCon() {
    $db = new PDO("mysql:host=127.0.0.1;dbname=cc_project","root","");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $db;
}

return function (App $app) {
    //Fetch all tags
    $app->get('/api/tags/', function (Request $request, Response $response, $args) {
        $db = getCon();
        $sql = "SELECT * FROM tags";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $response->getBody()->write(json_encode($stmt->fetchAll(PDO::FETCH_ASSOC)));
        return $response;
    });

    //Search tags
    $app->get('/api/tags/search/{val}', function (Request $request, Response $response, $args) {
        $db = getCon();
        $sql = "SELECT * FROM tags WHERE tag_name LIKE '%";
        $sql .=$args['val'];
        $sql .= "%' ";
        $sql .= "LIMIT 10";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $response->getBody()->write(json_encode($stmt->fetchAll(PDO::FETCH_ASSOC)));
        return $response;
    });
    
    //Fetch by tag ids
    $app->get('/api/tags/{tag_id}', function (Request $request, Response $response, $args) {
        $db = getCon();
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
        $db = getCon();
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
        $db = getCon();
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
        $header = trim($_SERVER['HTTP_AUTHORIZATION']);
        $token = null;
        if(preg_match('/Bearer\s(\S+)/', $header, $matches))
            $token = $matches[1];
        if(!$token) {
            $res = [
                'code' => 9003,
                'message' => 'Authorization header not found'
            ];
            $response->getBody()->write(json_encode($res));
            return $response;
        }
        $username = Authentication::decode_token($token)->username;
        $res = [
            'code' => 9001,
            'message' => 'Success',
            'username' => $username
        ];
        $response->getBody()->write(json_encode($res));
        return $response;
    });    

};
