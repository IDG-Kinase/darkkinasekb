package DarkKinaseKB;
use Text::CSV::Simple;
use Text::CSV qw( csv );
use Data::Dumper;
use File::Basename;
use strict;

our $VERSION = '0.1';

hook before => sub { };

get '/tissues' => sub {
  my %template_data;

  my @GTEx_csv_files = <'../data_sets/GTEx_highly_expressed_kinases/*'>;

  for (@GTEx_csv_files) {
	  my ($tissue_name,$dir,$ext) = fileparse(basename($_),'.csv');
	  $template_data{tissues}{$tissue_name} = csv(
		  in => $_, 
		  headers => 'auto');
  }

  template 'tissues' => \%template_data;
};


true;
