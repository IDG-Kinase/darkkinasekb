package DarkKinaseKB;
use Dancer2;

use static_pages

our $VERSION = '0.1';

get '/tools' => sub {
  template 'tools';
};

get '/publications' => sub {
  template 'publications';
};

get '/people' => sub {
  template 'people';
};

get '/kinase_bubbles' => sub {
  template 'kinase_bubbles';
};

get '/home_alternative' => sub {
  template 'home_alternative';
};

get '/compounds/UNC-CAF-181' => sub {
  template 'compounds/UNC-CAF-181';
};

true;
