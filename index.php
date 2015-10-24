<?php
require 'vendor/autoload.php';

$app = new Slim\App();

$app->get('/', function($request, $response, $args) {
    echo 'Hello Word';
});

$app->run();