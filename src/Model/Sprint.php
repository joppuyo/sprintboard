<?php
namespace Sprintboard\Model;

use Illuminate\Database\Eloquent\Model;

class Sprint extends Model
{
    protected $touches = ['team'];

    public function cards()
    {
        return $this->hasMany('Sprintboard\Model\Card');
    }

    public function team()
    {
        return $this->belongsTo('\Sprintboard\Model\Team');
    }
}
