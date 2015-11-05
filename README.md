# Sprintboard

A board that tracks your sprint goals.

**Work in progress!**

## Requirements

- PHP 5.5 or greater
- Composer
- Apache
- MySQL
- Node.js and npm

## Installation

Create a new MySQL database named `sprintboard`. Duplicate `config.sample.php` to a file named `config.php` and put
your database credentials in it. After that, run the following command to install all the dependencies and run the
migrations.

`composer install && vendor/bin/phinx migrate -c config-phinx.php && npm install && gulp sass`

## License

This work is licensed under the terms of the StopNerds Public License  
version 1.1, as published by the StopNerds Foundation.  
See http://stopnerds.github.io/license/ for more information.