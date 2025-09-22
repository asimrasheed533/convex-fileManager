import FileManager from '@/components/file-manager';
import Header from '@/components/header';

export default async function Dashboard() {
  return (
    <>
      <Header />
      <FileManager />
    </>
  );
}
