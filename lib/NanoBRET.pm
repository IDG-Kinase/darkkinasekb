package DarkKinaseKB;

use Dancer2;
use Text::CSV;
use Cwd;
use Data::Dumper;
use Math::Round;
use POSIX;
use Text::Fuzzy;
use List::MoreUtils qw(uniq);
use File::Basename;

our $VERSION = '0.1';

get '/NanoBRET' => sub {
	#############################################################################
	# NanoBRET Data
	#############################################################################
	my $NanoBRET_info = csv(in => '../data_sets/dark_NanoBRET_promega.csv',
		headers => 'auto') or die "$!";
	
	my %template_data;

	$template_data{NanoBRET_info} = $NanoBRET_info;
	
	my @tracer_sheets = <"../public/tracer_sheets/*">;
	foreach my $index (0..$#{$template_data{NanoBRET_info}}) {
		my $this_kinase = $template_data{NanoBRET_info}[$index]{symbol};
		my @tracer_sheet_hits = grep $_ =~ /NL-$this_kinase(-Cyclin)? / | 
									 $_ =~ /$this_kinase-NL(-Cyclin)? / |
									 $_ =~ /$this_kinase /, @tracer_sheets;
		if (scalar(@tracer_sheet_hits) > 0) {
			$template_data{NanoBRET_info}[$index]{tracer_sheet_file} = basename($tracer_sheet_hits[0]);
		} else {
			$template_data{NanoBRET_info}[$index]{tracer_sheet_file} = "NA";
		}
	}
	
	template 'NanoBRET/NanoBRET' => \%template_data;
};

true;
