<?php

use \MyProject\Migration\Migration;

class InitialMigration extends Migration
{
    public function up()
    {
        $this->schema->create('boards', function(\Illuminate\Database\Schema\Blueprint $table){
            $table->increments('id');
            $table->string('hash');
            $table->string('name');
            $table->timestamps();
        });
        $this->schema->create('items', function(\Illuminate\Database\Schema\Blueprint $table){
            $table->increments('id');
            $table->string('name');
            $table->boolean('is_done');
            $table->timestamps();
            $table->integer('board_id')->unsigned();
            $table->foreign('board_id')->references('id')->on('boards')->onDelete('cascade');
        });
    }
}
