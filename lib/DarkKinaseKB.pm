package DarkKinaseKB;
use Dancer2;
use Text::CSV::Simple;
use Cwd;
use Data::Dumper;
use Math::Round;
use POSIX;
use Text::Fuzzy;

our $VERSION = '0.1';

hook before => sub {
  my $parser = Text::CSV::Simple->new;
  my @kinase_info = $parser->read_file('../data_sets/full_kinase_list.csv') or die "$!";

  my @dark_kinase_info;
  for (1..(scalar(@kinase_info) - 1)) {
    if ($kinase_info[$_][3] eq "Dark") {
      push @dark_kinase_info, $kinase_info[$_][1];
    }
  }

  var kinase_info => \@kinase_info;
  var dark_kinase_info => \@dark_kinase_info;
};

get '/' => sub {
  my @kinase_info = @{var 'kinase_info'};
  
  my @kinase_list = @{var 'dark_kinase_info'};

  @kinase_list = sort @kinase_list;
  
  my $kinase_list_length = ceil(scalar(@kinase_list)/10);
    
  my %split_kinase_lists = (
    1 => [ splice @kinase_list, 0, $kinase_list_length ],
    2 => [ splice @kinase_list, 0, $kinase_list_length ],
    3 => [ splice @kinase_list, 0 ,$kinase_list_length ],
    4 => [ splice @kinase_list, 0 ,$kinase_list_length ],
    5 => [ splice @kinase_list, 0 ,$kinase_list_length ],
    6 => [ splice @kinase_list, 0 ,$kinase_list_length ],
    7 => [ splice @kinase_list, 0 ,$kinase_list_length ],
    8 => [ splice @kinase_list, 0 ,$kinase_list_length ],
    9 => [ splice @kinase_list, 0 ,$kinase_list_length ],
    10 => [ splice @kinase_list, 0 ],
  );

  template 'index' => { 'title' => 'DarkKinaseKB', 
                        'kinase_1' => $split_kinase_lists{1},
                        'kinase_2' => $split_kinase_lists{2},
                        'kinase_3' => $split_kinase_lists{3},
                        'kinase_4' => $split_kinase_lists{4},
                        'kinase_5' => $split_kinase_lists{5},
                        'kinase_6' => $split_kinase_lists{6},
                        'kinase_7' => $split_kinase_lists{7},
                        'kinase_8' => $split_kinase_lists{8},
                        'kinase_9' => $split_kinase_lists{9},
                        'kinase_10' => $split_kinase_lists{10},
                      };
};

get '/kinase/:kinase' => sub {
  my $parser = Text::CSV::Simple->new;
  my @PRM_info = $parser->read_file('../data_sets/curve_info.csv') or die "$!";
  
  my @kinase_info = @{var 'kinase_info'};
  
  my $kinase = params->{kinase};
  
  my @this_kinase_info = grep $_->[1] eq $kinase, @kinase_info;
  
  my @this_PRM_info = grep $_->[0] eq $kinase, @PRM_info;
  
  my $include_PRM = 1;
  if (scalar(@this_PRM_info) == 0) {
    $include_PRM = 0;
  }

  my $hgnc_num = "NA"; 
  if($this_kinase_info[0][0] =~ /(\d+)/) {
    $hgnc_num = $1;
  }

  my %template_data = ('kinase' => $kinase, 'title' => $kinase, 
    'hgnc_num' => $hgnc_num, 'description' => $this_kinase_info[0][4],
    'include_PRM' => $include_PRM, 'PRM_info' => \@this_PRM_info);

  template 'kinase' => \%template_data;
};

get '/search' => sub {
  my @kinase_info = @{var 'kinase_info'};
  my @this_kinase_info = grep $_->[1] eq params->{kinase_text}, @kinase_info;
  
  # The search hit only one kinase, forward the user onto that kinase page
  if (scalar(@this_kinase_info) == 1) {
    redirect '/kinase/'.$this_kinase_info[0][1];
  }
  
  my $search_text = params->{kinase_text};

  my $kinase_search = Text::Fuzzy->new($search_text);
  my @kinase_list = map $_->[1], @kinase_info[1..$#kinase_info];
  
  my @potential_matches = grep $_ =~ /$search_text/i, @kinase_list;

  my @nearest = $kinase_search->nearestv(\@kinase_list);
  
  push @potential_matches, @nearest;

  @potential_matches = @potential_matches[0..9];
  
  my %template_data =('potential_matches' => \@potential_matches);

  template 'search' => \%template_data;
};

true;
