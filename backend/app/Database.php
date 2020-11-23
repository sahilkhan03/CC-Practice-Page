<?php
declare(strict_types=1);

class Database
{
    function getCon() {
        $db = new PDO("mysql:host=127.0.0.1;dbname=cc_project","root","");
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $db;
    } 
}