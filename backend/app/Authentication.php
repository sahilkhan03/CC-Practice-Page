<?php
declare(strict_types=1);
define('SECRET_KEY', 'ccprojectsecretkey');

use \Firebase\JWT\JWT;

class Authentication
{
    function generate_token($username) {
        $payload = [
            "iat" => time(),
            "exp" => time() + (3600 * 24),
            "username" => $username
        ];
        return JWT::encode($payload, SECRET_KEY);
    }

}