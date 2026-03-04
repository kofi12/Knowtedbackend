import { Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { Course } from '../lib/mockData';
import { Progress } from './ui/progress';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const colorClasses = {
    indigo: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20',
    teal: 'from-teal-500/10 to-teal-500/5 border-teal-500/20',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
  };

  return (
    <Link to={`/course/${course.id}`} className="block h-full">
      <div className="bg-card border border-border rounded-lg md:rounded-xl hover:shadow-md transition-all duration-200 group h-full flex flex-col p-4 md:p-6">
        {/* Color gradient accent */}
        <div
          className={`h-2 rounded-full mb-4 md:mb-6 bg-gradient-to-r ${
            colorClasses[course.color as keyof typeof colorClasses] || colorClasses.indigo
          }`}
        />

        {/* Course name */}
        <h3 className="text-base md:text-lg font-semibold group-hover:text-primary transition-colors mb-4 md:mb-6">
          {course.name}
        </h3>

        {/* Stats */}
        <div className="space-y-2 md:space-y-3 text-sm mb-4 md:mb-6 flex-1">
          <div className="flex items-start gap-2 md:gap-3">
            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{course.materialsCount} materials</span>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="hidden sm:inline">Completed {course.completedCount} tasks</span>
            <span className="sm:hidden">{course.completedCount} tasks</span>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="hidden sm:inline">Updated {course.lastUpdated}</span>
            <span className="sm:hidden">{course.lastUpdated}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="pt-4 md:pt-6 border-t border-border">
          <div className="text-xs md:text-sm text-muted-foreground mb-2">Progress</div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-1">
              <Progress 
                value={course.progress} 
                color={course.color as any}
                showLabel={false}
              />
            </div>
            <span className="text-xs md:text-sm font-semibold">{course.progress}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}