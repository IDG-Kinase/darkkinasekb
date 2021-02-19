# Dark Kinase Knowledgebase
This is the source code for the Dark Kinase Knowledgebase available through [https://darkkinome.org](darkkinome.org). This website summarises and displays some of the work created through the [https://druggablegenome.net/](Illuminating the Druggable Genome) NIH program dedicated to working on understudied kinases.

The website uses the Perl framework [https://perldancer.org/](Dancer) as a backend to serve pages. If you would like to start a testing server to see a local copy of the website, you can use this command from the "public" directory:

```
plackup -R ../lib/ ../bin/app.psgi
```
The website requires several perl modules to start. You can install them with this command:

```
cpanm Dancer2 Text::CSV::Simple Math::Round Text::Fuzzy List::MoreUtils
```
