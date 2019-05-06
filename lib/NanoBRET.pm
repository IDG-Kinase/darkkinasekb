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

	template 'NanoBRET' => \%template_data;
};


true;
