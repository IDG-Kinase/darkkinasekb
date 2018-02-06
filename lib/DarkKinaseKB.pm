package DarkKinaseKB;
use Dancer2;

our $VERSION = '0.1';

get '/' => sub {
    template 'index' => { 'title' => 'DarkKinaseKB' };
};

get '/kinase/:kinase' => sub {
  

  template 'kinase' => { 'kinase' => params->{kinase} };
};


true;
