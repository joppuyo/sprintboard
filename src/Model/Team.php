<?php
namespace Sprintboard\Model;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    public function sprints()
    {
        return $this->hasMany('Sprintboard\Model\Sprint');
    }
}
