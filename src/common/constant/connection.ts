export const connection: Connection = {
  CONNECTION_STRING: 'Mysql://12341/sad',
  DB: 'MYSQL',
  DBNAME: 'TEST',
};

export type Connection = {
  CONNECTION_STRING: string;
  DB: string;
  DBNAME: string;
};
