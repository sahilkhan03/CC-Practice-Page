<?php
declare(strict_types=1);
define('SECRET_KEY', 'ccprojectsecretkey');

use \Firebase\JWT\JWT;

class Authentication
{
    public function generate_token($username) {
        $payload = [
            "iat" => time(),
            "username" => $username
        ];
        return JWT::encode($payload, SECRET_KEY);
    }
    
    function parse_token($header) {
        $header = trim($header);
        $token = null;
        if(preg_match('/Bearer\s(\S+)/', $header, $matches))
            $token = $matches[1];
        return $token;
    }

    public function decode_token($header) {
        $token = self::parse_token($header);
        if($token) {
            $payload = null;
            try {
                $payload = JWT::decode($token, SECRET_KEY, array('HS256'));
            } catch (\Exception $e) {
                return null;
            }
            return $payload;
        }
        return $token;
    }

    public function validate($header) {
        $payload = self::decode_token($header);
        if(!$payload) return false;
        $db = (new Database)->getCon();
        $sql = "SELECT username from users where username='".$payload->username."'";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}