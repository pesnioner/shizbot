import { DataSource } from 'typeorm';
import DataSourceOptionsGenerator from './config';

export default class Db {
    static _ds: DataSource | undefined;

    static getDataSource() {
        if (!Db._ds) {
            Db._ds = new DataSource(new DataSourceOptionsGenerator().options);
        }
        return Db._ds;
    }
}
