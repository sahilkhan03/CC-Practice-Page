<?php
declare(strict_types=1);

class Database
{
    function getCon() {
        $db = new PDO("mysql:host=remotemysql.com;dbname=XwIMcpmGHd","XwIMcpmGHd","Zk5MabR9hb");
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $db;
    } 
}