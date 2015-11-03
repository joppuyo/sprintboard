<?php
require 'vendor/autoload.php';

session_start();

$configuration = [
  'settings' => [
    'displayErrorDetails' => true,
  ],
];
$container = new \Slim\Container($configuration);
$app = new \Slim\App($container);

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
    if ($req->isPost()){
        $board = new \Sprintboard\Model\Board();
        $board->name = $req->getParam('name');
        $board->hash = $this->generateHash;
        $board->save();
        return $res->withRedirect($this->router->pathFor('boardView', ['boardHash' => $board->hash]));
    }
    return $this->view->render($res, 'boardAdd.twig');
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

$app->group('/api', function(){
    $this->get('/', function(){
       echo 'API running';
    });
    // Get information about board
    $this->get('/board/{boardHash}', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        $board = \Sprintboard\Model\Board::where('hash', $args['boardHash'])->get();
        $board->load('cards');
        return $res->withJson($board);
    });
    // Add new card to a board
    // Example of JSON payload: {"name": "My Example Card"}
    $this->post('/board/{boardHash}/card', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        $board = \Sprintboard\Model\Board::where('hash', $args['boardHash'])->first();
        $card = new \Sprintboard\Model\Card();
        $body = $req->getParsedBody();
        $name = $body['name'];
        if (!$name) {
            return $res->withJson(['error' => 'Missing name parameter'], 400);
        }
        $card->name = $name;
        $board->cards()->save($card);
        return $res->withStatus(201);
    });
    // Get all cards related to a board
    $this->get('/board/{boardHash}/card', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        $board = \Sprintboard\Model\Board::where('hash', $args['boardHash'])->firstOrFail();
        $board->load('cards');
        return $res->withJson($board->cards);
    });
    // Delete a card from a board
    $this->delete('/board/{boardHash}/card/{cardId}', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        try {
            $card = \Sprintboard\Model\Card::where('id', $args['cardId'])->firstOrFail();
            $card->delete();
            return $res->withStatus(204);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['error' => 'Card not found'], 400);
        }
    });
});

$app->run();