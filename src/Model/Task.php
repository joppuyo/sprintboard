<?php
namespace Sprintboard\Model;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $casts = [
      'is_done' => 'boolean'
    ];

    protected $touches = ['card'];

    public function card()
    {
        return $this->belongsTo('\Sprintboard\Model\Card');
    }

    public function sprint()
    {
        return $this->card->sprint();
    }

    public function team()
    {
        return $this->card->sprint->team();
    }
}
