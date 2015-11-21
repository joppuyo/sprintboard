<?php
require 'vendor/autoload.php';

session_cache_limiter(false);
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

$container['cache'] = function () {
    return new \Slim\HttpCache\CacheProvider();
};

$app->add(new \Slim\HttpCache\Cache('public', 0));

$container['view'] = function ($c) {
    $view = new \Slim\Views\Twig('templates');
    $view->addExtension(new Slim\Views\TwigExtension(
      $c['router'],
      $c['request']->getUri()
    ));
    return $view;
};

$app->map(['GET', 'POST'], '/', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
    if ($req->isPost()) {
        $board = new \Sprintboard\Model\Sprint();
        $board->name = $req->getParam('name');
        $board->hash = $this->generateHash;
        $board->save();
        return $res->withRedirect($this->router->pathFor('boardView', ['boardHash' => $board->hash]));
    }
    return $this->view->render($res, 'boardAdd.twig');
});

$app->get('/team/{teamHash}', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args) {
    try {
        $team = \Sprintboard\Model\Team::where('hash', $args['teamHash'])->firstOrFail();
        $this->view->offsetSet('team', $team);
        return $this->view->render($res, 'teamView.twig');
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return $this->notFoundHandler($req, $res);
    }
})->setName('teamView');

$app->get('/team/{teamHash}/{sprintId}', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
    try {
        $sprint = \Sprintboard\Model\Sprint::findOrFail($args['sprintId']);
        $team = \Sprintboard\Model\Team::where('hash', $args['teamHash'])->firstOrFail();
        $this->view->offsetSet('team', $team);
        $this->view->offsetSet('sprint', $sprint);
        return $this->view->render($res, 'boardView.twig');
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return $this->notFoundHandler($req, $res);
    }
})->setName('boardView');

$app->group('/api', function(){
    $this->get('/', function(){
       echo 'API running';
    });
    // Get information about board
    $this->get('/team/{teamHash}', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        try {
            // TODO: when implemented in Slim-HttpCache, return response immediately See: https://github.com/slimphp/Slim-HttpCache/issues/10
            $lastModified = \Sprintboard\Model\Team::where('hash', $args['teamHash'])->firstOrFail()->value('updated_at');
            $res = $this->cache->withLastModified($res, \Carbon\Carbon::parse($lastModified)->timestamp);

            $team = \Sprintboard\Model\Team::with([
                'sprints' => function($query) {
                    return $query->orderBy('start_datetime');
                },
                'sprints.cards',
                'sprints.cards.tasks' => function($query) {
                    return $query->orderBy('index');
                }
            ])->where('hash', $args['teamHash'])
              ->firstOrFail();
            return $res->withJson($team);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['message' => 'Board not found'], 404);
        }
    });
    // Get information about sprint
    $this->get('/team/{teamHash}/{sprintId}', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        try {
            $team = \Sprintboard\Model\Team::with([
                'sprints' => function($query) {
                    return $query->orderBy('start_datetime');
                },
                'sprints.cards',
                'sprints.cards.tasks' => function($query) {
                    return $query->orderBy('index');
                }
            ])->where('hash', $args['teamHash'])
                ->firstOrFail();
            return $res->withJson($team);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['message' => 'Board not found'], 404);
        }
    });
    // Add new card to a board
    // Example of JSON payload: {"name": "My Example Card"}
    $this->post('/team/{teamHash}/{sprintId}/card', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        try {
            $sprint = \Sprintboard\Model\Sprint::findOrFail($args['sprintId']);
            $card = new \Sprintboard\Model\Card();
            $body = $req->getParsedBody();
            $name = empty($body['name']) ? null : $body['name'];
            if (!$name) {
                return $res->withJson(['message' => 'Missing name parameter'], 400);
            }
            $card->name = $name;
            $sprint->cards()->save($card);
            return $res->withStatus(201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['message' => 'Sprint not found'], 404);
        }

    });
    // Rename a card
    $this->put('/card/{cardId}', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        try {
            $body = $req->getParsedBody();
            if (empty($body['name'])) {
                return $res->withJson(['message' => 'Missing name parameter'], 400);
            }
            $card = \Sprintboard\Model\Card::where('id', $args['cardId'])->firstOrFail();
            $card->name = $body['name'];
            $card->save();
            return $res->withStatus(204);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['message' => 'Card not found'], 404);
        }
    });
    // Delete a card from a board
    $this->delete('/card/{cardId}', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        try {
            $card = \Sprintboard\Model\Card::where('id', $args['cardId'])->firstOrFail();
            $card->delete();
            return $res->withStatus(204);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['message' => 'Card not found'], 404);
        }
    });
    // Add new task to a card
    // Example of JSON payload: {"name": "My Example Task"}
    $this->post('/card/{cardId}/task', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        $body = $req->getParsedBody();
        $name = empty($body['name']) ? null : $body['name'];
        if (!$name) {
            return $res->withJson(['message' => 'Missing name parameter'], 400);
        }
        try {
            $card = \Sprintboard\Model\Card::findOrFail($args['cardId']);
            $task = new \Sprintboard\Model\Task();
            $task->name = $name;
            $task->is_done = false;
            $maxIndex = $card->tasks()->max('index');
            if (!is_null($maxIndex)) {
                $task->index = $maxIndex + 1;
            }
            $card->tasks()->save($task);
            return $res->withStatus(201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['message' => 'Card not found'], 404);
        }
    });
    // Mark a task to be done or unmark it
    $this->map(['PUT', 'DELETE'], '/task/{taskId}/done', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        try {
            $task = \Sprintboard\Model\Task::findOrFail($args['taskId']);
            if ($req->isPut()) {
                $task->is_done = true;
            } else if ($req->isDelete()) {
                $task->is_done = false;
            }
            $task->save();
            return $res->withStatus(201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['message' => 'Task not found'], 404);
        }
    });
    // Delete a task
    $this->delete('/task/{taskId}', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
        try {
            $task = \Sprintboard\Model\Task::findOrFail($args['taskId']);
            $task->delete();
            return $res->withStatus(204);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['message' => 'Task not found'], 404);
        }
    });
    // Rename a task
    $this->put('/task/{taskId}', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args) {
        $body = $req->getParsedBody();
        $name = empty($body['name']) ? null : $body['name'];
        if (!$name) {
            return $res->withJson(['message' => 'Missing name parameter'], 400);
        }
        try {
            $task = \Sprintboard\Model\Task::findOrFail($args['taskId']);
            $task->name = $name;
            $task->save();
            return $res->withStatus(204);
       } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['message' => 'Task not found'], 404);
       }
    });
    $this->put('/card/{cardId}/sort', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args) {
        $body = $req->getParsedBody();
        try {
            foreach ($body as $index => $taskId) {
                $task = \Sprintboard\Model\Task::findOrFail($taskId);
                $task->index = $index;
                $task->save();
            }
            return $res->withStatus(204);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['message' => 'Task not found'], 404);
        }
    });
    // Add a new sprint. Copies the undone task from last sprint. Returns the new sprint object
    $this->post('/team/{teamHash}/sprint', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args) {
        $body = $req->getParsedBody();
        try {
            $team = \Sprintboard\Model\Team::with([
                'sprints' => function($query) {
                    return $query->orderBy('start_datetime', 'desc');
                },
                'sprints.cards.tasks' => function($query) {
                    return $query->where('is_done', false); // Load only those tasks that are not done
                }]
            )->where('hash', $args['teamHash'])->firstOrFail();
            $sprint = new \Sprintboard\Model\Sprint();

            // TODO: validate request data
            $sprint->name = $body['name'];
            $sprint->start_datetime = \Carbon\Carbon::parse($body['start_date'])->toDateTimeString();
            $sprint->end_datetime = \Carbon\Carbon::parse($body['end_date'])->toDateTimeString();

            $lastSprint = $team->sprints->first();

            $team->sprints()->save($sprint);

            foreach ($lastSprint->cards as $card) {
                $cardModel = new \Sprintboard\Model\Card();
                $cardModel->name = $card->name;
                $sprint->cards()->save($cardModel);
                foreach ($card->tasks as $task) {
                    $taskModel = new \Sprintboard\Model\Task();
                    $taskModel->name = $task->name;
                    $taskModel->is_done = false;
                    $cardModel->tasks()->save($taskModel);
                }
            }

            return $res->withJson($sprint);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $res->withJson(['message' => 'Team not found'], 404);
        }
    });
});

$app->get('/browserconfig.xml', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
   return $this->view->render($res, 'browserconfig.twig');
});

$app->get('/manifest.json', function(\Slim\Http\Request $req, \Slim\Http\Response $res, $args){
    return $this->view->render($res, 'manifest.twig');
});

$app->run();
