<?php
namespace Sprintboard\Model;

use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    public function cards()
    {
        return $this->hasMany('Sprintboard\Model\Card');
    }
}