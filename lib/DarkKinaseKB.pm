package DarkKinaseKB;
use Dancer2;
use Text::CSV::Simple;
use Cwd;
use Data::Dumper;

our $VERSION = '0.1';

get '/' => sub {
    template 'index' => { 'title' => 'DarkKinaseKB' };
};

get '/kinase/:kinase' => sub {
  my $parser = Text::CSV::Simple->new;
  my @kinase_info = $parser->read_file('../data_sets/full_kinase_list.csv') or die "$!";
  
  my @kinase_list;
  for (0..(scalar(@kinase_info) - 1)) {
    push @kinase_list, $kinase_info[$_][0];
  }

  my $kinase = params->{kinase};
  

  my %template_data = ('kinase' => params->{kinase});

  template 'kinase' => \%template_data;
};

true;
