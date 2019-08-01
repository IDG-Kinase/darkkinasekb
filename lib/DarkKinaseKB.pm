package DarkKinaseKB;
use Dancer2;
use Text::CSV::Simple;
use Cwd;
use Data::Dumper;
use Math::Round;
use POSIX;
use Text::Fuzzy;
use List::MoreUtils qw(uniq);
use File::Basename;

use static_pages;
use compounds;
use tissues;
use traits;
use NanoBRET;

our $VERSION = '0.1';

hook before => sub {
	my $kinase_info = csv(in => '../data_sets/all_kinases.csv', 
		headers => 'auto') or die "$!";
	
	my @dark_kinase_info = grep $_->{class} eq "Dark", @{$kinase_info};
	
	var kinase_info => \@{$kinase_info};
	var dark_kinase_info => \@dark_kinase_info;
};

get '/' => sub {
	template 'index';
};

get '/kinase/:kinase' => sub {
	my @kinase_info = @{var 'kinase_info'};

	#############################################################################
	# General Kinase Infomation
	#############################################################################

	my %template_data;
	$template_data{kinase} = route_parameters->get('kinase');
	$template_data{title} = $template_data{kinase};

	my @this_kinase_info = grep $_->{symbol} eq $template_data{kinase}, @kinase_info;
	$template_data{description} = $this_kinase_info[0]->{name}; 

	my $hgnc_num = "NA";
	if($this_kinase_info[0]->{hgnc_id} =~ /(\d+)/) {
		$template_data{hgnc_num} = $1;
	}

	#############################################################################
	# Long Kinase Descriptions
	#############################################################################
	my @kinase_description_file = grep $_ =~ /$template_data{kinase}/, 
	<'../data_sets/kinase_descriptions/*'>;

	$template_data{include_long_description} = 0;
	if (scalar(@kinase_description_file) == 1) {
		$template_data{include_long_description} = 1;

		open INPUT, "<$kinase_description_file[0]" or 
		debug("Can't open, " . $kinase_description_file[0]);
		my @kinase_text = <INPUT>;
		close INPUT;

		my $kinase_text = join("",@kinase_text);

		$template_data{kinase_text} = $kinase_text;
	} 

	#############################################################################
	# PRM Images
	#############################################################################
	my $parser = Text::CSV::Simple->new;
	my @PRM_info = $parser->read_file('../data_sets/PRM_curve_data.csv') or die "$!";

	my @this_PRM_info = grep $_->[0] eq $template_data{kinase}, @PRM_info;
	$template_data{PRM_info} = \@this_PRM_info;

	$template_data{include_PRM} = 1;
	if (scalar(@this_PRM_info) == 0) {
		$template_data{include_PRM} = 0;
	}

	#############################################################################
	# ReNcell Images
	#############################################################################
	my @ReNcell_file_matches = grep basename($_) eq "$template_data{kinase}.svg", 
	<'../public/images/ReNcell/*'>;

	$template_data{include_ReNcell} = 0;
	if (scalar(@ReNcell_file_matches) > 0) {
		$template_data{include_ReNcell} = 1;
	}

	#############################################################################
	# INDRA Clustered Results
	#############################################################################
	my @INDRA_clustered_file_matches = grep basename($_) eq "$template_data{kinase}.png",
	<'../public/images/INDRA/clustered/*'>;

	$template_data{include_clustered_INDRA} = 0;
	if (scalar(@INDRA_clustered_file_matches) > 0) {
		$template_data{include_clustered_INDRA} = 1;

		$parser = Text::CSV::Simple->new;
		my @INDRA_clustered = $parser->read_file('../data_sets/INDRA_URL_clustered.csv') or die "$!";

		@INDRA_clustered = grep $_->[0] eq $template_data{kinase}, @INDRA_clustered;

		$template_data{clustered_INDRA_URL} = $INDRA_clustered[0][1];
	}

	#############################################################################
	# INDRA Filtered Results
	#############################################################################
	my @INDRA_filtered_file_matches = grep basename($_) eq "$template_data{kinase}.png", 
	<'../public/images/INDRA/filtered/*'>;

	$template_data{include_filtered_INDRA} = 0;
	if (scalar(@INDRA_filtered_file_matches) > 0) {
		$template_data{include_filtered_INDRA} = 1;

		$parser = Text::CSV::Simple->new;
		my @INDRA_filtered = $parser->read_file('../data_sets/INDRA_URL_filtered.csv') or die "$!";

		@INDRA_filtered = grep $_->[0] eq $template_data{kinase}, @INDRA_filtered;

		$template_data{filtered_INDRA_URL} = $INDRA_filtered[0][1];
	}

	#############################################################################
	# APMS Results
	#############################################################################
	open(FILE, "../public/javascripts/PPI/ppi.json");
	$template_data{include_APMS} = grep{/\"$template_data{kinase}\"/} <FILE>;
	close FILE;

	#############################################################################
	# KO Cell Line Data
	#############################################################################
	$parser = Text::CSV::Simple->new;
	my @KO_info = $parser->read_file('../data_sets/horizon_DK_KO_full.csv') or die "$!";

	@KO_info = grep $_->[2] eq $template_data{kinase}, @KO_info;

	$template_data{include_KO} = 0;
	if (scalar(@KO_info) > 0) {
		$template_data{include_KO} = 1;
		$template_data{KO_info} = \@KO_info;
	}
	
	#############################################################################
	# Mouse KO Data
	#############################################################################
	$parser = Text::CSV::Simple->new;
	my @mouse_KO_info = $parser->read_file('../data_sets/IMPC_KO.csv') or die "$!";

	@mouse_KO_info = grep $_->[0] eq $template_data{kinase}, @mouse_KO_info;

	$template_data{include_mouse_KO} = 0;
	if (scalar(@mouse_KO_info) > 0) {
		$template_data{include_mouse_KO} = 1;
		$template_data{mouse_KO_info} = \@mouse_KO_info;
	}

	#############################################################################
	# Recombinant Protein Data
	#############################################################################
	$parser = Text::CSV::Simple->new;
	my @recomb_info = $parser->read_file('../data_sets/thermo_recomb_proteins.csv') or die "$!";

	@recomb_info = grep $_->[1] eq $template_data{kinase}, @recomb_info;

	$template_data{include_recomb} = 0;
	if (scalar(@recomb_info) > 0) {
		$template_data{include_recomb} = 1;
		$template_data{recomb_info} = \@recomb_info;
	}
	
	#############################################################################
	# NanoBRET Data
	#############################################################################
	$parser = Text::CSV::Simple->new;
	my $NanoBRET_info = csv(in => '../data_sets/dark_NanoBRET_promega.csv',
		headers => 'auto') or die "$!";

	my @NanoBRET_hits = grep $_->{'symbol'} eq $template_data{kinase}, @{$NanoBRET_info};
	
	$template_data{include_NanoBRET} = 0;
	if (scalar(@NanoBRET_hits) > 0) {
		$template_data{include_NanoBRET} = 1;
		$template_data{NanoBRET_info} = $NanoBRET_hits[0];
		
		#search the tracer sheets for this kinase, if present mark as validated
		$template_data{NanoBRET_info}{validated} = 0;
		my @tracer_sheets = <"../public/tracer_sheets/*">;
		my @tracer_sheet_hits = grep $_ =~ /NL-$template_data{kinase}(-Cyclin)? / | 
									 $_ =~ /$template_data{kinase}-NL(-Cyclin)? /, @tracer_sheets;
		if (scalar(@tracer_sheet_hits) > 0) {
			$template_data{NanoBRET_info}{validated} = 1;
			$template_data{NanoBRET_info}{tracer_sheet_file} = basename($tracer_sheet_hits[0]);
		}
	}

	#############################################################################
	# Compound Data
	#############################################################################

	my $compound_parser = Text::CSV::Simple->new;
	my @compounds = $compound_parser->read_file('../data_sets/compounds.csv') or die "$!";

	my %kinase_name_rows;
	for (1..$#compounds) {
		if ($compounds[$_][1] eq '') {
			next;
		} else {
			$kinase_name_rows{$compounds[$_][1]} = $_;
		}
	}

	if (! defined $kinase_name_rows{$template_data{kinase}}) {
		$template_data{compound}{include} = 0;
	} else {
		$template_data{compound}{include} = 1;
		my $kinase_row = $kinase_name_rows{$template_data{kinase}};
		for (0..scalar(@{$compounds[0]})) {
			my $header = $compounds[0][$_];
			$template_data{compound}{$header} = $compounds[$kinase_row][$_];
		}

		if ($template_data{source} eq "SGC-UNC") {
			$template_data{from_SGC} = 1;
		} else {
			$template_data{from_SGC} = 0;
		}
	}

	#############################################################################
	# PDB Kinase Domain Data
	#############################################################################
	$template_data{pdb_domain}{include} = 0;

	if (-e "../data_sets/PDB_kinases/$template_data{kinase}.csv") {
		$template_data{pdb_domain}{include} = 1;

		my $data = csv(
			in => "../data_sets/PDB_kinases/$template_data{kinase}.csv",
			headers => 'auto');

		for my $entry_num (0..scalar(@$data) - 1) {
			my @split_smiles = split(";",$data->[$entry_num]{smiles});
			$data->[$entry_num]{smiles} = \@split_smiles;

			my @split_chemicalName = split(";",$data->[$entry_num]{chemicalName});
			$data->[$entry_num]{chemicalName} = \@split_chemicalName;
		}
		$template_data{pdb_domain}{data} = $data;
	}

	#############################################################################
	# Template Passing
	#############################################################################

	template 'kinase' => \%template_data;
};

get '/search' => sub {
	my @dark_kinase_info = @{var 'dark_kinase_info'};
	my @this_kinase_info = grep $_->{symbol} eq params->{kinase_text}, @dark_kinase_info;

	# The search hit only one kinase, forward the user onto that kinase page
	if (scalar(@this_kinase_info) == 1) {
		debug(Dumper(\@this_kinase_info));
		redirect '/kinase/'.$this_kinase_info[0]{symbol};
	}

	my $search_text = params->{kinase_text};

	my $kinase_search = Text::Fuzzy->new($search_text);
	my @kinase_list = map $_->{symbol}, @dark_kinase_info;

	my @potential_matches = grep $_ =~ /$search_text/i, @kinase_list;

	my @nearest = $kinase_search->nearestv(\@kinase_list);

	push @potential_matches, @nearest;

	@potential_matches = uniq(@potential_matches);

	# @potential_matches = @potential_matches[0..9];

	my %template_data = ('potential_matches' => \@potential_matches);

	template 'search' => \%template_data;
};

get '/data' => sub {
	my @kinase_list = @{var 'dark_kinase_info'};
	
	@kinase_list = map $_->{symbol}, @kinase_list;
	@kinase_list = sort @kinase_list;
	
	my %template_data;
	$template_data{title} = 'DKK - Data Sources and Repositories';
	$template_data{all_kinases} = \@kinase_list;

	$template_data{compounds} = csv(
		in => '../data_sets/compounds.csv',
		headers => 'auto');

	$template_data{NanoBRET} = csv(
		in => '../data_sets/dark_NanoBRET_promega.csv',
		headers => 'auto');
    
	my @tracer_sheets = <"../public/tracer_sheets/*">;
	foreach my $index (0..$#{$template_data{NanoBRET}}) {
		my $this_kinase = $template_data{NanoBRET}[$index]{symbol};
		my @tracer_sheet_hits = grep $_ =~ /NL-$this_kinase(-Cyclin)? / | 
									 $_ =~ /$this_kinase-NL(-Cyclin)? /, @tracer_sheets;
		if (scalar(@tracer_sheet_hits) > 0) {
			$template_data{NanoBRET}[$index]{tracer_sheet_file} = basename($tracer_sheet_hits[0]);
		} else {
			$template_data{NanoBRET}[$index]{tracer_sheet_file} = "NA";
		}
	}

    my @NanoBRET_keep;
    for (@{$template_data{NanoBRET}}) {
        if($_->{tracer_sheet_file} ne "NA") {
          push @NanoBRET_keep, $_;
        }
    }
    
    $template_data{NanoBRET} = \@NanoBRET_keep;

	template 'data' => \%template_data;
};

get '/PRM_params' => sub {
	my %template_data;
	$template_data{prm_params_headers} = csv(
		in => '../data_sets/param_table.csv'
	);

	$template_data{prm_params_data} = csv(
		in => '../data_sets/param_table.csv',
		headers => "skip"
	);
	
	$template_data{peptide_seq_headers} = csv(
		in => '../data_sets/pep_seq_table.csv'
	);

	$template_data{peptide_seq_data} = csv(
		in => '../data_sets/pep_seq_table.csv',
		headers => "skip"
	);

	template 'prm_params' => \%template_data;
};

true;
