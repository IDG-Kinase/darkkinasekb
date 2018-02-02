#!/usr/bin/env perl

use strict;
use warnings;
use FindBin;
use lib "$FindBin::Bin/../lib";


# use this block if you don't need middleware, and only have a single target Dancer app to run here
use DarkKinaseKB;

DarkKinaseKB->to_app;

=begin comment
# use this block if you want to include middleware such as Plack::Middleware::Deflater

use DarkKinaseKB;
use Plack::Builder;

builder {
    enable 'Deflater';
    DarkKinaseKB->to_app;
}

=end comment

=cut

=begin comment
# use this block if you want to mount several applications on different path

use DarkKinaseKB;
use DarkKinaseKB_admin;

use Plack::Builder;

builder {
    mount '/'      => DarkKinaseKB->to_app;
    mount '/admin'      => DarkKinaseKB_admin->to_app;
}

=end comment

=cut

