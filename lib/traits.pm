package DarkKinaseKB;
use Text::CSV::Simple;
use Text::CSV qw( csv );
use Data::Dumper;
use File::Basename;
use strict;

our $VERSION = '0.1';

hook before => sub { };

get '/traits' => sub {
  my %template_data;

  my @GWAS_csv_files = <'../data_sets/GWAS_catalog_traits/*'>;

  for (@GWAS_csv_files) {
	  my ($kinase_name,$dir,$ext) = fileparse(basename($_),'.csv');
	  debug($kinase_name);
	  $template_data{traits}{$kinase_name} = csv(
		  in => $_, 
		  headers => 'auto');
  }

  template 'traits' => \%template_data;
};


true;
