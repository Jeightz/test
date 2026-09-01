import ReportForm from "../../components/ReportForm";

export default function ReportPage() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Anonymous report</p>
        <h1>Report a product price</h1>
        <p>
          Submit a live camera photo with automatically detected location. No login
          is required.
        </p>
      </header>
      <ReportForm />
    </main>
  );
}
