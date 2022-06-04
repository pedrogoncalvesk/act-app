import { ReactNode, Fragment } from 'react';
import Link from 'next/link';
import { Row, Col, PageHeader, Pagination, Divider } from 'antd';
const { convert } = require('html-to-text')

import Metadata from '../../components/Metadata/index';
import Search, { useSearch } from '../../components/Search';
import CardActivity from '../../components/CardActivity';
import { PaginateActivities } from '../../factories/paginate-activities';
import styles from '../../styles/SearchPage.module.scss';
import NotFoundActivity from '../../components/NotFoundActivity';

export async function getServerSideProps(context: any) {
  const { q, p } = context.query
  const params = new URLSearchParams()
  const search = typeof q === 'string' && q !== '' ? q : null
  const page = !Number.isNaN(parseInt(p)) ? parseInt(p) : null

  if (search) {
    params.append('search', search)
  }

  if (page) {
    params.append('page', String(page))
  }

  const activities = await fetch(`https://act-api-dev-r5khawnfbq-uc.a.run.app/activities?${params}`)
    .then(async res => {
      const json = await res.json()
      if (res.ok) {
        return json
      }
      throw new Error(JSON.stringify(json))
    })
    .catch(error => {
      console.error(error.message)
      return {
        data: [],
        count: 0,
        currentPage: 1,
        pages: 1,
        perPage: 20,
        total: 0
      }
    })

  return {
    props: { search, activities },
  };
}

export interface SearchPageProps {
  search: string;
  activities: PaginateActivities;
}

export default function SearchPage({ search, activities }: SearchPageProps) {
  const { data, total, perPage, currentPage, pages } = activities
  const timeout = 500

  const callbackChange = (callback: Function) => setTimeout(callback, timeout)
  const [query, router] = useSearch(search || '', callbackChange)

  const isLoading = typeof query !== 'string' || query !== (search || '')

  const paginationRender = (
    page: number,
    type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
    element: ReactNode
  ) => {
    let p: string = ''
    let hasLink = false
    const params = new URLSearchParams()

    if (search) {
      params.append('q', search)
    }

    if (type === 'prev' && page !== 0) {
      p = String(currentPage - 1)
      hasLink = true
    } else if (type === 'next' && currentPage < pages) {
      p = String(currentPage + 1)
      hasLink = true
    } else if (type === 'page') {
      p = String(page)
      hasLink = true
    }

    params.append('p', p)
    return hasLink ? (
      <Link href={`/search?${params}`}>
        {element}
      </Link>
    ) : element
  }

  return (
    <Fragment>
      <Metadata title={search ? `${search} - Pesquisa atividades` : 'Pesquisa atividades'} />
      <Row gutter={16} justify="center" align="middle">
        <Col span={16}>
          <PageHeader
            className={styles.pageHeader}
            onBack={() => router.back()}
            title="Busca"
            extra={(
              <Search
                query={search || ''}
                width="600px"
                timeout={timeout}
                isLoading={isLoading}
                hasQuery
                allowClear
              />
            )}
          />
        </Col>
      </Row>
      <Divider />
      <Row gutter={16} justify="center" align="middle">
        <Col span={16}>
        {data.length ? (
          <Row gutter={[16, 16]} align="middle">
            {data.map(({ id, title, type, statement }) => (
              <Col key={id} span={6}>
                <CardActivity
                  id={id}
                  title={title}
                  type={type}
                  statement={convert(statement, { wordwrap: 200 })}
                  loading={isLoading}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <NotFoundActivity />
        )}
        </Col>
      </Row>
      <br />
      <br />
      <Row gutter={16} justify="center" align="middle">
        <Col span={16}>
          <Pagination
            current={currentPage}
            defaultCurrent={1}
            pageSize={perPage}
            defaultPageSize={20}
            total={total}
            showSizeChanger={false}
            itemRender={paginationRender}
            onChange={() => {}}
            hideOnSinglePage
          />
        </Col>
      </Row>
      <br />
      <br />
      <br />
    </Fragment>
  )
}
