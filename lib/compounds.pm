package DarkKinaseKB;
use Text::CSV::Simple;
use Data::Dumper;

our $VERSION = '0.1';

hook before => sub { };

get '/compounds/:compound' => sub {
  my $parser = Text::CSV::Simple->new;
  my @compounds = $parser->read_file('../data_sets/compounds.csv') or die "$!";

  my %compound_name_rows;
  for (1..$#compounds) {
	  if ($compounds[$_][0] eq '') {
		  next;
	  } else {
		  $compound_name_rows{$compounds[$_][0]} = $_;
	  }
  }
  
  my %template_data;
  $template_data{compound} = route_parameters->get('compound');
  $template_data{title} = $template_data{compound};
  
  # debug(Dumper(\%compound_name_rows));

  if (! defined $compound_name_rows{$template_data{compound}}) {
	  template 'missing_compounds';
  } else {
	  my $compound_row = $compound_name_rows{$template_data{compound}};
	  for (0..scalar(@{$compounds[0]})) {
		  my $header = $compounds[0][$_];
		  $template_data{$header} = $compounds[$compound_row][$_];
	  }

	  if ($template_data{source} eq "SGC-UNC") {
		  $template_data{from_SGC} = 1;
	  } else {
		  $template_data{from_SGC} = 0;
	  }

	  debug(Dumper(\%template_data));
	
	  template 'compounds' => \%template_data;
  }
};

true;
