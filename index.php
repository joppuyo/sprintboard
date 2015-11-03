<?php
require 'vendor/autoload.php';

session_start();

$app = new Slim\App();

require 'config.php';

use Illuminate\Database\Capsule\Manager as Capsule;
$capsule = new Capsule;
$capsule->addConnection([
  'driver' => 'mysql',
  'host' => DB_HOST,
  'port' => DB_PORT,
  'database' => DB_NAME,
  'username' => DB_USER,
  'password' => DB_PASSWORD,
  'charset' => 'utf8',
  'collation' => 'utf8_unicode_ci',
]);

$capsule->bootEloquent();
$capsule->setAsGlobal();
$container = $app->getContainer();
$container['generateHash'] = function (){
    $factory = new RandomLib\Factory;
    $generator = $factory->getMediumStrengthGenerator();
    return $generator->generateString(8, $generator::CHAR_LOWER);
};

$container['view'] = function ($c) {
    $view = new \Slim\Views\Twig('templates');
    $view->addExtension(new Slim\Views\TwigExtension(
      $c['router'],
      $c['request']->getUri()
    ));
    return $view;
};

$app->map(['GET', 'POST'], '/add-board', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
    $this->view->render($res, 'boardAdd.twig');
    if ($req->isPost()){
        $board = new \Sprintboard\Model\Board();
        $board->name = $req->getParam('name');
        $board->hash = $this->generateHash;
        $board->save();
        return $res->withRedirect($this->router->pathFor('boardView', ['boardHash' => $board->hash]));
    }
});

$app->get('/board/{boardHash}', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
    try {
        $board = \Sprintboard\Model\Board::where('hash', $args['boardHash'])->firstOrFail();
        $this->view->offsetSet('board', $board);
        $this->view->render($res, 'boardView.twig');
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return $this->notFoundHandler($req, $res);
    }
})->setName('boardView');

$app->run();