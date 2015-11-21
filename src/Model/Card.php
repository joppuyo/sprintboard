<?php
namespace Sprintboard\Model;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    protected $touches = ['sprint'];

    public function tasks()
    {
        return $this->hasMany('Sprintboard\Model\Task');
    }
    public function sprint()
    {
        return $this->belongsTo('\Sprintboard\Model\Sprint');
    }

    public function team()
    {
        return $this->sprint->team();
    }
}
