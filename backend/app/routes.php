<?php
declare(strict_types=1);

use Slim\App;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

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
};
