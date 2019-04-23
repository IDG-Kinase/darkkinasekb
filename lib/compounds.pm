package DarkKinaseKB;
use Text::CSV::Simple;
use Text::CSV qw( csv );
use Data::Dumper;
use strict;

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
			push @{$compound_name_rows{$compounds[$_][0]}}, $_;
			# $compound_name_rows{$compounds[$_][0]} = $_;
		}
	}

	# debug(Dumper(\%compound_name_rows));

	my %template_data;
	$template_data{compound} = route_parameters->get('compound');
	$template_data{title} = $template_data{compound};

	# debug(Dumper(\%compound_name_rows));

	if (! defined $compound_name_rows{$template_data{compound}}) {
		template 'missing_compounds';
	} else {
		my @compound_row = @{$compound_name_rows{$template_data{compound}}};

		#cycle through the columns in the data file, copying info from the
		#appropriate rows into a hash that will be passed onto the compound
		#template page
		for my $column_index (0..scalar(@{$compounds[0]})-1) {
			my $header = $compounds[0][$column_index];

			#some of the compounds have multiple kinases associated, so we need to
			#deal with the kinase column separately
			if ($header eq "kinase") {
				for (@compound_row) {
					push @{$template_data{$header}}, $compounds[$_][$column_index];
				}
			} else {
				$template_data{$header} = $compounds[$compound_row[0]][$column_index];
			}
		}

		#Text change if the source is UNC
		if ($template_data{source} eq "SGC-UNC") {
			$template_data{from_SGC} = 1;
		} else {
			$template_data{from_SGC} = 0;
		}

		# debug(Dumper(\%template_data));

		template 'compounds' => \%template_data;
	}
};

get '/compounds' => sub {
	my %template_data;
	$template_data{compounds} = csv(
		in => '../data_sets/compounds.csv',
		headers => 'auto');

	template 'all_compounds' => \%template_data;
};

true;
