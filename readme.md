## POSTGRE NOTIFY TEST


Requirement:
- PostgreSQL 9 atau lebih
- Node JS 10 atau lebih

Instalasi fungsi dan trigger di database PostgreSQL:

```
CREATE OR REPLACE FUNCTION notify_table_update()
	RETURNS TRIGGER
	LANGUAGE PLPGSQL
AS
$$
BEGIN
	IF TG_OP = 'INSERT' THEN
		PERFORM pg_notify(
		'notify_' || TG_TABLE_NAME,
		'{"source": "' || TG_TABLE_NAME || '", "method": "insert", "new":' || row_to_json(NEW)::text  || '}'
		);
		RETURN NEW;
	END IF;

	IF TG_OP = 'UPDATE' THEN
		PERFORM pg_notify(
		'notify_' || TG_TABLE_NAME,
		'{"source": "' || TG_TABLE_NAME || '", "method": "update", "new":' || row_to_json(NEW)::text  || ',"old":'  || row_to_json(old)::text || '}'
		);
		RETURN NEW;
	END IF;

	IF TG_OP = 'DELETE' THEN
		PERFORM pg_notify(
		'notify_' || TG_TABLE_NAME,
		'{"source": "' || TG_TABLE_NAME || '", "method": "delete", "old":'  || row_to_json(OLD)::text || '}'
		);
		RETURN OLD;
	END IF;
END;
$$;

CREATE TRIGGER regpatient_notify_trigger
 -- example table regpatient
AFTER UPDATE OR INSERT OR DELETE ON regpatient
FOR EACH ROW
EXECUTE PROCEDURE notify_table_update();
```

Instalasi aplikasi:

```
npm install
```

Setup variable `databaseURL` di dalam file `index.js` dalam bentuk `postgresql://username:password@host:port/dbname`

Run:
```
npm run start
```
