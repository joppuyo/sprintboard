<?php
namespace Sprintboard\Model;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    public function tasks()
    {
        return $this->hasMany('Sprintboard\Model\Task');
    }
}