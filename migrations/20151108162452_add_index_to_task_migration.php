<?php

use \Sprintboard\Migration\Migration;

class AddIndexToTaskMigration extends Migration
{
    public function up()
    {
        $this->schema->table('tasks', function(\Illuminate\Database\Schema\Blueprint $table) {
           $table->integer('index');
        });
    }
}
