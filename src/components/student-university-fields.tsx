'use client';

import { useId } from 'react';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { MARITAL_STATUSES, STUDENT_UNIVERSITY_LIMITS, studentUniversityFormValues, type StudentUniversityDetails, type StudentUniversityField } from '@/lib/student-university-fields';

const LABELS: Record<StudentUniversityField, [string, string]> = {
  placeOfBirth: ['Place of birth (must match passport)', '出生地（须与护照一致）'],
  nativeLanguage: ['Native language', '母语'],
  maritalStatus: ['Marital status', '婚姻状况'],
  religion: ['Religion', '宗教信仰'],
  yearsInHomeCountry: ['Years of living in your home country', '在本国居住年数'],
  sponsorEmail: ['Financial sponsor’s email (father’s email)', '经济担保人邮箱（父亲邮箱）'],
  guarantorName: ['Guarantor name', '保证人姓名'],
  guarantorRelationship: ['Relationship to student', '与学生关系'],
  guarantorPhone: ['Guarantor phone', '保证人电话'],
  guarantorEmail: ['Guarantor email', '保证人邮箱'],
};
const PERSONAL: StudentUniversityField[] = ['placeOfBirth', 'nativeLanguage', 'maritalStatus', 'religion', 'yearsInHomeCountry', 'sponsorEmail'];
const GUARANTOR: StudentUniversityField[] = ['guarantorName', 'guarantorRelationship', 'guarantorPhone', 'guarantorEmail'];

export function StudentUniversityFields({ values, onChange }: {
  values: Partial<Record<StudentUniversityField, string>>;
  onChange: (key: StudentUniversityField, value: string) => void;
}): React.JSX.Element {
  const prefix = useId();
  const { locale } = useI18n();
  const zh = locale === 'zh';
  function renderField(key: StudentUniversityField): React.JSX.Element {
    const id = `${prefix}-${key}`;
    return <Field key={key}>
      <FieldLabel htmlFor={id}>{LABELS[key][zh ? 1 : 0]}</FieldLabel>
      {key === 'maritalStatus' ? <Select value={values[key] || '__none__'} onValueChange={value => onChange(key, value === '__none__' ? '' : value)}>
        <SelectTrigger id={id} className="w-full rounded-none"><SelectValue /></SelectTrigger>
        <SelectContent><SelectGroup>
          <SelectItem value="__none__">{zh ? '未提供' : 'Not provided'}</SelectItem>
          {MARITAL_STATUSES.map((status, index) => <SelectItem key={status} value={status}>{zh ? ['未婚', '已婚', '离婚', '丧偶'][index] : status}</SelectItem>)}
        </SelectGroup></SelectContent>
      </Select> : <Input id={id} name={key} value={values[key] ?? ''} onChange={event => onChange(key, event.target.value)}
        type={key.endsWith('Email') ? 'email' : key.endsWith('Phone') ? 'tel' : key === 'yearsInHomeCountry' ? 'number' : 'text'}
        inputMode={key.endsWith('Email') ? 'email' : key.endsWith('Phone') ? 'tel' : key === 'yearsInHomeCountry' ? 'decimal' : undefined}
        min={key === 'yearsInHomeCountry' ? 0 : undefined} max={key === 'yearsInHomeCountry' ? 150 : undefined}
        step={key === 'yearsInHomeCountry' ? '0.01' : undefined}
        maxLength={key === 'yearsInHomeCountry' ? undefined : STUDENT_UNIVERSITY_LIMITS[key]}
        autoComplete="off" className="rounded-none" aria-describedby={key === 'placeOfBirth' ? `${id}-hint` : undefined} />}
      {key === 'placeOfBirth' && <FieldDescription id={`${id}-hint`}>{zh ? '请严格按照护照所示填写。' : 'Enter exactly as shown on your passport.'}</FieldDescription>}
    </Field>;
  }
  return <div className="flex flex-col gap-6">
    <FieldSet>
      <FieldLegend>{zh ? '大学申请资料' : 'University application details'}</FieldLegend>
      <FieldDescription>{zh ? '以下项目均为选填，可稍后补充。' : 'These details are optional and can be completed later.'}</FieldDescription>
      <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">{PERSONAL.map(renderField)}</FieldGroup>
    </FieldSet>
    <FieldSet>
      <FieldLegend>{zh ? '保证人' : 'Guarantor'}</FieldLegend>
      <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">{GUARANTOR.map(renderField)}</FieldGroup>
    </FieldSet>
  </div>;
}

export function StudentUniversityDetailsView({ student }: { student: StudentUniversityDetails }): React.JSX.Element {
  const { locale } = useI18n();
  const zh = locale === 'zh';
  const values = studentUniversityFormValues(student);
  return <section className="flex flex-col gap-4">
    <h2 className="font-semibold">{zh ? '大学申请资料及保证人' : 'University application details & guarantor'}</h2>
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[...PERSONAL, ...GUARANTOR].map(key => <div key={key} className="min-w-0">
        <dt className="text-sm text-muted-foreground">{LABELS[key][zh ? 1 : 0]}</dt>
        <dd className="break-words text-sm">{values[key] || (zh ? '未提供' : 'Not provided')}</dd>
      </div>)}
    </dl>
  </section>;
}
