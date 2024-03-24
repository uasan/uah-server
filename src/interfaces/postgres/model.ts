export abstract class TableModel {
  updatedAt: Date = new Date();
  createdAt: Date = new Date();

  static async patch(ctx: any, payload: any) {
    //
  }

}
