package DarkKinaseKB;
use Dancer2;

our $VERSION = '0.1';

get '/about' => sub {
  template 'about';
};

get '/tools' => sub {
  template 'tools';
};

get '/publications' => sub {
  template 'publications';
};

get '/people' => sub {
  template 'people';
};

get '/DK_CRISPRi' => sub {
  template 'DK_CRISPRi';
};

get '/kinase_bubbles' => sub {
  template 'kinase_bubbles';
};

get '/home_alternative' => sub {
  template 'home_alternative';
};

get '/cluster_analysis' => sub {
  template 'cluster_analysis';
};

true;
