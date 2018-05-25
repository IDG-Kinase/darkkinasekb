package DarkKinaseKB;
use Dancer2;
use Text::CSV::Simple;
use Cwd;
use Data::Dumper;
use Math::Round;
use POSIX;

our $VERSION = '0.1';

get '/' => sub {
  my $parser = Text::CSV::Simple->new;
  my @kinase_info = $parser->read_file('../data_sets/full_kinase_list.csv') or die "$!";
  
  my @kinase_list;
  #skip the first line, header
  for (1..(scalar(@kinase_info) - 1)) {
    if ($kinase_info[$_][3] eq "Dark") {
      push @kinase_list, $kinase_info[$_][1];
    }
  }

  @kinase_list = sort @kinase_list;
  
  my $kinase_list_length = ceil(scalar(@kinase_list)/3);
    
  my %split_kinase_lists = (
    1 => [ splice @kinase_list, 0, $kinase_list_length ],
    2 => [ splice @kinase_list, 0, $kinase_list_length ],
    3 => [ splice @kinase_list, 0 ]
  );

  template 'index' => { 'title' => 'DarkKinaseKB' , 
                        'kinase_1' => $split_kinase_lists{1},
                        'kinase_2' => $split_kinase_lists{2},
                        'kinase_3' => $split_kinase_lists{3}
                      };
};

get '/kinase/:kinase' => sub {
  my $parser = Text::CSV::Simple->new;
  my @kinase_info = $parser->read_file('../data_sets/full_kinase_list.csv') or die "$!";
  
  my @kinase_list;
  for (0..(scalar(@kinase_info) - 1)) {
    push @kinase_list, $kinase_info[$_][0];
  }

  my $kinase = params->{kinase};

  my %template_data = ('kinase' => $kinase, 'title' => $kinase);

  template 'kinase' => \%template_data;
};

true;
