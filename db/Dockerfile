FROM postgres
COPY backup.sql /backup.sql
COPY restore.sh /restore.sh
RUN chmod +x /restore.sh
CMD ["/restore.sh"]