<?php

use \Sprintboard\Migration\Migration;

class AddTeamMigration extends Migration
{
    public function up()
    {
        $this->schema->create('teams', function(\Illuminate\Database\Schema\Blueprint $table){
            $table->increments('id');
            $table->string('name');
            $table->string('hash');
            $table->timestamps();
        });

        $this->schema->table('sprints', function(\Illuminate\Database\Schema\Blueprint $table){
            $table->dateTime('start_datetime');
            $table->dateTime('end_datetime');
            $table->dropColumn('hash');
            $table->integer('team_id')->unsigned()->nullable();
            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
        });
    }
}
