echo "Compounds"

find /var/log/httpd/DarkKinaseKB_access.log* -newermt "1 July 2021" -not -newermt "31 December 2021" -exec grep compounds\.csv \{\} \; | wc

echo "NanoBRET"

find /var/log/httpd/DarkKinaseKB_access.log* -newermt "1 July 2021" -not -newermt "31 December 2021" -exec grep dark_NanoBRET\.csv \{\} \; | wc

echo "PRM"

find /var/log/httpd/DarkKinaseKB_access.log* -newermt "1 July 2021" -not -newermt "31 December 2021" -exec grep param_table\.csv \{\} \; | wc

echo "Proximity"

find /var/log/httpd/DarkKinaseKB_access.log* -newermt "1 July 2021" -not -newermt "31 December 2021" -exec grep ppi\.csv \{\} \; | wc
