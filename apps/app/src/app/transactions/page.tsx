import { Card, CardHeader, CardTitle } from "@leaseup/ui/components/card";
export default async function Transactions() {
  return (
    <div className="mx-auto mt-10 flex max-w-7xl flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Transactions</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
