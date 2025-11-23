export abstract class TableModel {
  updated_at: Date = new Date();
  created_at: Date = new Date();

  static async patch(ctx: any, payload: any): Promise<any[] | undefined> {
    return [];
  }
}
