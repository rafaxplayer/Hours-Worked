import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { CalendarEvent } from 'angular-calendar';
import { DayType } from '../../interfaces/interfaces';

@Injectable()
export class DatabaseProvider {

  private database: SQLiteObject;
  private dbReady = new BehaviorSubject<boolean>(false);

  constructor(private platform: Platform, private sqlite: SQLite) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'worked-hours.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          this.database = db;

          this.createTables().then(() => {
            //communicate we are ready!
            this.dbReady.next(true);
          });
        })

    });
  }

  private isReady() {
    return new Promise((resolve, reject) => {
      //if dbReady is true, resolve
      if (this.dbReady.getValue()) {
        resolve();
      }
      //otherwise, wait to resolve until dbReady returns true
      else {
        this.dbReady.subscribe((ready) => {
          if (ready) {
            resolve();
          }
        });
      }
    })
  }

  private createTables() {
    return this.database.executeSql(
      `CREATE TABLE IF NOT EXISTS horarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          horario TEXT
        );`
      , [])
      .then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS dialibre (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT UNIQUE,
          daytype TEXT
          );`, [])
      }).catch((err) => console.log("error detected creating tables", err));
  }

  closeDatabase() {
    this.database.close();
  }

  //Horarios
  getHorarios() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql("SELECT * from horarios", [])
          .then((data) => {
            let horarios = [];
            for (let i = 0; i < data.rows.length; i++) {
              horarios.push(data.rows.item(i));
            }
            return horarios;
          })
      })
  }

  addHorario(horario: CalendarEvent) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO horarios ( horario) VALUES ('${JSON.stringify(horario)}');`, []).then((result) => {
          if (result.insertId) {
            return this.getHorario(result.insertId);
          }
        });
      });
  }

  getHorario(id: number) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * FROM horarios WHERE id = ${id}`, [])
          .then((data) => {
            if (data.rows.length) {
              return data.rows.item(0);
            }
            return null;
          })
      })
  }

  updateHorario(horario: CalendarEvent) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`UPDATE horarios SET horario='${JSON.stringify(horario)}' WHERE id=${horario.meta.id}`, []).then((result) => {
          if (result.insertId) {
            return this.getHorario(result.insertId);
          }
        });
      });
  }

  deleteHorario(id: number) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`DELETE FROM horarios WHERE id = ${id}`, [])

      })
  }

  // Dias Festivos

  getFreeDays() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql("SELECT * from dialibre", [])
          .then((data) => {
            let freedays = [];
            for (let i = 0; i < data.rows.length; i++) {
              freedays.push(data.rows.item(i));
            }
            return freedays;
          })
      })
  }

  addFreeDay(date: Date, data: DayType) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`REPLACE INTO dialibre ( date, daytype) VALUES ('${date.toDateString()}' ,'${JSON.stringify(data)}');`, [])
          .then((result) => {
            if (result.insertId) {
              return this.getFreeDay(result.insertId);
            }
          });
      });
  }

  getFreeDay(id: number) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * FROM dialibre WHERE id = ${id}`, [])
          .then((data) => {
            if (data.rows.length) {
              return data.rows.item(0);
            }
            return null;
          })
      })
  }

  removeFreeDays() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`DELETE FROM dialibre WHERE id > 0`, [])

      })

  }


}
