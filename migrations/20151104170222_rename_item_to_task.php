<?php

use \Sprintboard\Migration\Migration;

class RenameItemToTask extends Migration
{
    public function up()
    {
        $this->schema->rename('items', 'tasks');
    }
}
