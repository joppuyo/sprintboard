<?php
namespace Sprintboard\Model;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    public function cards()
    {
        return $this->hasMany('Sprintboard\Model\Sprint');
    }
}
