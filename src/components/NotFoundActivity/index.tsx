import Link from 'next/link';
import { Button, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function NotFoundActivity() {
  return (
    <Empty
      image="/not-found-activities.svg"
      description="Não encontrou o que procurava?"
    >
      <Link href="/new-activity">
        <Button type="primary" shape="round" size="large" icon={<PlusOutlined />}>
          Nova atividade
        </Button>
      </Link>
    </Empty>
  )
}
