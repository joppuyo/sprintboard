<?php

use \Sprintboard\Migration\Migration;

class RenameBoardToSprintMigration extends Migration
{
    public function up()
    {
        $this->schema->rename('boards', 'sprints');
        $this->schema->table('cards', function(\Illuminate\Database\Schema\Blueprint $table) {
            $table->dropForeign('cards_board_id_foreign');
            $table->renameColumn('board_id', 'sprint_id');
            $table->foreign('sprint_id')->references('id')->on('sprints')->onDelete('cascade');
        });
    }
}
